// Lấy các phần tử trên trang web
const metronomeDiv = document.querySelector('.metronome');
const bpmValueSpan = document.getElementById('bpm-value');
const bpmSlider = document.getElementById('bpm-slider');
const minusButton = document.getElementById('bpm-minus');
const plusButton = document.getElementById('bpm-plus');
const startStopButton = document.getElementById('start-stop');
const visualBeat = document.querySelector('.visual-beat');

// Khởi tạo Web Audio API để tạo âm thanh chính xác
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Biến trạng thái
let bpm = 120;
let isPlaying = false;
let timerId = null;

// --- CÁC HÀM XỬ LÝ ---

// Hàm cập nhật hiển thị BPM trên màn hình
function updateDisplay() {
    bpmValueSpan.textContent = bpm;
    bpmSlider.value = bpm;
}

// Hàm tạo ra tiếng "bíp"
function playTick() {
    // Tạo một oscillator (bộ tạo sóng âm)
    const oscillator = audioContext.createOscillator();
    // Tạo một gain node (để kiểm soát âm lượng và tránh tiếng click)
    const gainNode = audioContext.createGain();

    // Thiết lập tần số (âm cao hay thấp)
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Tần số 880 Hz (nốt La)
    
    // Kết nối các node: oscillator -> gain -> loa
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Tạo hiệu ứng âm thanh ngắn, giảm dần để nghe như tiếng "bíp"
    gainNode.gain.setValueAtTime(10, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);

    // Bắt đầu và dừng oscillator để tạo âm thanh ngắn
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
}

// Hàm xử lý cho mỗi nhịp
function tick() {
    // Phát âm thanh
    playTick();

    // Hiển thị nhịp bằng hình ảnh
    visualBeat.classList.add('active');
    // Tắt hiệu ứng hình ảnh sau một khoảng thời gian ngắn
    setTimeout(() => {
        visualBeat.classList.remove('active');
    }, 100);
}

// Hàm bắt đầu hoặc dừng metronome
function startStop() {
    isPlaying = !isPlaying; // Đảo ngược trạng thái

    if (isPlaying) {
        // Bắt đầu
        startStopButton.textContent = 'Dừng Lại';
        metronomeDiv.classList.add('playing');
        
        // Bắt đầu vòng lặp nhịp
        // Công thức: (60 / BPM) * 1000 = mili giây mỗi nhịp
        timerId = setInterval(tick, (60 / bpm) * 1000);
        tick(); // Gọi ngay nhịp đầu tiên không cần chờ
    } else {
        // Dừng
        startStopButton.textContent = 'Bắt đầu';
        metronomeDiv.classList.remove('playing');
        clearInterval(timerId); // Dừng vòng lặp
        timerId = null;
    }
}

// Hàm thay đổi BPM và cập nhật lại bộ đếm giờ nếu đang chạy
function changeBPM(newBPM) {
    bpm = newBPM;
    updateDisplay();

    // Nếu đang chạy, phải xóa bộ đếm giờ cũ và tạo cái mới với BPM mới
    if (isPlaying) {
        clearInterval(timerId);
        timerId = setInterval(tick, (60 / bpm) * 1000);
    }
}

// --- GÁN SỰ KIỆN CHO CÁC NÚT ---

startStopButton.addEventListener('click', startStop);

minusButton.addEventListener('click', () => {
    if (bpm <= 40) return; // Giới hạn dưới
    changeBPM(bpm - 1);
});

plusButton.addEventListener('click', () => {
    if (bpm >= 240) return; // Giới hạn trên
    changeBPM(bpm + 1);
});

bpmSlider.addEventListener('input', (e) => {
    changeBPM(parseInt(e.target.value));
});

// --- KHỞI TẠO ---
updateDisplay(); // Hiển thị giá trị BPM ban đầu khi tải trang