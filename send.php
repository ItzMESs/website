<?php
// Үнийн санал авах формын хүсэлтийг имэйлээр илгээнэ.
// Өөрийн имэйл хаягаа энд бичнэ:
$TO = 'messdevelopment1@gmail.com';

header('Content-Type: application/json; charset=utf-8');

function reply($ok, $message) {
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(false, 'Буруу хүсэлт.');
// Спам бот нуугдсан талбарыг бөглөдөг
if (!empty($_POST['website'])) reply(true, 'Баярлалаа!');

$clean = function ($k) {
    return trim(str_replace(["\r", "\n"], ' ', strip_tags($_POST[$k] ?? '')));
};
$name = $clean('name');
$email = filter_var($_POST['email'] ?? '', FILTER_VALIDATE_EMAIL);
if ($name === '' || !$email) reply(false, 'Нэр, имэйлээ зөв бөглөнө үү.');

$types = [
    '1200000' => 'Нэг хуудас сайт', '1500000' => 'Компанийн сайт', '3500000' => 'Онлайн дэлгүүр',
    '4000000' => 'Захиалгат систем',
];
$extras = array_map('strip_tags', (array) ($_POST['extras'] ?? []));

$body = "Шинэ үнийн санал авах хүсэлт\n\n"
    . "Нэр: $name\n"
    . "Имэйл: $email\n"
    . "Утас: " . $clean('phone') . "\n"
    . "Төрөл: " . ($types[$_POST['type'] ?? ''] ?? '-') . "\n"
    . "Нэмэлт: " . ($extras ? implode(', ', $extras) : '-') . "\n"
    . "Тооцоолсон үнэ: " . $clean('estimate') . "\n\n"
    . "Зурвас:\n" . strip_tags($_POST['message'] ?? '') . "\n";

$headers = "From: noreply@" . ($_SERVER['SERVER_NAME'] ?? 'localhost') . "\r\n"
    . "Reply-To: $email\r\n"
    . "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = @mail($TO, '=?UTF-8?B?' . base64_encode('Үнийн санал: ' . $name) . '?=', $body, $headers);
reply($sent, $sent ? 'Баярлалаа! Бид 24 цагийн дотор холбогдоно.' : 'Илгээж чадсангүй. Имэйлээр шууд холбогдоно уу.');
