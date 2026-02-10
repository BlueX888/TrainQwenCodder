const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  backgroundColor: '#2d2d2d'
};

// 状态变量
let shakeCount = 0;
let isShaking = false;
let statusText;
let keyW, keyA, keyS, keyD;
let lastShakeTime = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 绘制网格背景以便观察相机弹跳效果
  const graphics = this.add.graphics();
  
  // 绘制网格线
  graphics.lineStyle(1, 0x00ff00, 0.3);
  for (let x = 0; x <= 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y <= 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制中心标记
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(400, 300, 10);
  
  // 绘制四个角的标记
  graphics.fillStyle(0x00ffff, 1);
  graphics.fillCircle(50, 50, 8);
  graphics.fillCircle(750, 50, 8);
  graphics.fillCircle(50, 550, 8);
  graphics.fillCircle(750, 550, 8);
  
  // 添加文字说明
  const instructionText = this.add.text(400, 50, 'Press W/A/S/D to shake camera', {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
  instructionText.setOrigin(0.5);
  
  // 状态显示文本
  statusText = this.add.text(400, 100, 'Shake Count: 0\nStatus: Idle', {
    fontSize: '20px',
    color: '#00ff00',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 },
    align: 'center'
  });
  statusText.setOrigin(0.5);
  
  // 创建WASD键监听
  keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 获取相机引用
  const camera = this.cameras.main;
  
  // 监听按键按下事件
  const triggerShake = (keyName) => {
    // 避免在弹跳期间重复触发
    const currentTime = this.time.now;
    if (currentTime - lastShakeTime < 3000) {
      return;
    }
    
    // 触发相机弹跳效果，持续3000ms
    camera.shake(3000, 0.01);
    
    // 更新状态
    shakeCount++;
    isShaking = true;
    lastShakeTime = currentTime;
    
    console.log(`Camera shake triggered by ${keyName}. Count: ${shakeCount}`);
    
    // 3秒后重置状态
    this.time.delayedCall(3000, () => {
      isShaking = false;
      updateStatusText();
    });
    
    updateStatusText();
  };
  
  // 绑定按键事件
  keyW.on('down', () => triggerShake('W'));
  keyA.on('down', () => triggerShake('A'));
  keyS.on('down', () => triggerShake('S'));
  keyD.on('down', () => triggerShake('D'));
  
  // 更新状态文本的函数
  window.updateStatusText = function() {
    const status = isShaking ? 'Shaking...' : 'Idle';
    statusText.setText(`Shake Count: ${shakeCount}\nStatus: ${status}`);
  };
}

function update(time, delta) {
  // 实时更新状态显示（如果需要）
  // 这里主要用于展示，实际状态更新在事件中完成
}

// 创建游戏实例
const game = new Phaser.Game(config);