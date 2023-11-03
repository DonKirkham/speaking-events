#!/usr/bin/env bash
#export PS4="\$LINENO: "
#set -xv

echo
echo -e "\e[1;94mInstalling Node dependencies\e[0m"
FILE=./package-lock.json
if test -f "$FILE"; then
  npm ci
else
  npm install
fi

spfxVersion=$(echo $(grep -o '"@microsoft/sp-core-library": "[^"]*' package.json | grep -o '[^"]*$') | cut -d'.' -f 2)

## commands to create dev certificate and copy it to the root folder of the project
echo
echo -e "\e[1;94mGenerating dev certificate\e[0m"
gulp trust-dev-cert

echo
if (( $spfxVersion > 12 )); then
  echo -e "\e[1;94m   Copying certificate from .rushstack\e[0m"
  # Convert the generated PEM certificate to a  CER certificate
  openssl x509 -inform PEM -in ~/.rushstack/rushstack-serve.pem -outform DER -out ./spfx-dev-cert.cer
  cp ~/.rushstack/rushstack-serve.pem ./spfx-dev-cert.pem
else
  echo -e "\e[1;94m   Copying certificate from .gcb-serve-data\e[0m"
  cp ~/.gcb-serve-data/gcb-serve.cer ./spfx-dev-cert.cer
  cp ~/.gcb-serve-data/gcb-serve.cer ./spfx-dev-cert.pem
fi

## add *.cer to .gitignore to prevent certificates from being saved in repo
if ! grep -Fxq "*.cer" ./.gitignore
  then
    echo "# .CER Certificates" >> .gitignore
    echo "*.cer" >> .gitignore
fi

## add *.pem to .gitignore to prevent certificates from being saved in repo
if ! grep -Fxq "*.pem" ./.gitignore
  then
    echo "# .PEM Certificates" >> .gitignore
    echo "*.pem" >> .gitignore
fi

echo
echo -e "\e[1;92mReady!\e[0m"

echo -e "\n\e[1;94m**********\nOptional: if you plan on using gulp serve, don't forget to add the container certificate to your local machine. Please visit https://aka.ms/spfx-devcontainer for more information\n**********"

