$file = "server/services/movimientos.service.ts"
$lines = Get-Content $file

$targets = @(349,370,389,435,441,447,462,477,483,503,565,752,936)

foreach ($target in $targets) {
    $start = [Math]::Max(1, $target - 5)
    $end = [Math]::Min($lines.Length, $target + 5)

    "`n========== Líneas $start-$end (objetivo $target) =========="

    for ($i = $start; $i -le $end; $i++) {
        "{0,4}: {1}" -f $i, $lines[$i - 1]
    }
}