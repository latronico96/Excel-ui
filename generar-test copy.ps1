$file = "server/services/movimientos.service.ts"
$lines = Get-Content $file

for ($i = 240; $i -le 530; $i++) {
    "{0,4}: {1}" -f $i, $lines[$i - 1]
}