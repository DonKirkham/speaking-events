$tcpClient = New-Object -TypeName System.Net.Sockets.TcpClient;
$tcpClient.Connect("localhost", 4321);
$tcpStream = $tcpClient.GetStream();
$callback = { param($sender, $cert, $chain, $errors) return $true };
$sslStream = New-Object -TypeName System.Net.Security.SslStream -ArgumentList @($tcpStream, $true, $callback);
$sslStream.AuthenticateAsClient('');
$certificate = $SslStream.RemoteCertificate;
$x509Certificate = New-Object -TypeName System.Security.Cryptography.X509Certificates.X509Certificate2 -ArgumentList $certificate
$store = new-object System.Security.Cryptography.X509Certificates.X509Store(
    [System.Security.Cryptography.X509Certificates.StoreName]::Root,
    "localmachine"
)
$store.open("MaxAllowed");
$store.add($x509Certificate);
$store.close();