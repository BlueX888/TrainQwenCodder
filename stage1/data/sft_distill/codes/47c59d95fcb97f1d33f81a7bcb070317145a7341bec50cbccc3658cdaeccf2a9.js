const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: { preload, create, update },
  backgroundColor: '#2d2d2d'
};

// 状态信号变量
let flashCount = 0;
let flashText;
let infoText;
let keys;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 绘制背景网格
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  for (let x = 0; x < 800; x += 50) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 600);
  }
  for (let y = 0; y < 600; y += 50) {
    graphics.moveTo(0, y);
    graphics.lineTo(800, y);
  }
  graphics.strokePath();

  // 绘制一些彩色方块作为视觉参考
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  for (let i = 0; i < 6; i++) {
    const rect = this.add.graphics();
    rect.fillStyle(colors[i], 1);
    rect.fillRect(0, 0, 80, 80);
    rect.x = 100 + (i % 3) * 250;
    rect.y = 150 + Math.floor(i / 3) * 200;
  }

  // 添加中心圆形
  const circle = this.add.graphics();
  circle.fillStyle(0xffffff, 1);
  circle.fillCircle(400, 300, 40);

  // 添加提示文本
  infoText = this.add.text(400, 50, 'Press W/A/S/D to trigger camera flash', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  });
  infoText.setOrigin(0.5, 0.5);

  // 添加闪烁计数文本
  flashText = this.add.text(400, 550, `Flash Count: ${flashCount}`, {
    fontSize: '20px',
    color: '#00ff00',
    align: 'center'
  });
  flashText.setOrigin(0.5, 0.5);

  // 设置WASD键监听
  keys = this.input.keyboard.addKeys({
    W: Phaser.Input.Keyboard.KeyCodes.W,
    A: Phaser.Input.Keyboard.KeyCodes.A,
    S: Phaser.Input.Keyboard.KeyCodes.S,
    D: Phaser.Input.Keyboard.KeyCodes.D
  });

  // 为每个键添加按下事件监听
  const camera = this.cameras.main;
  
  keys.W.on('down', () => {
    triggerFlash(camera, 'W');
  });

  keys.A.on('down', () => {
    triggerFlash(camera, 'A');
  });

  keys.S.on('down', () => {
    triggerFlash(camera, 'S');
  });

  keys.D.on('down', () => {
    triggerFlash(camera, 'D');
  });

  // 闪烁触发函数
  function triggerFlash(camera, key) {
    // 触发相机闪烁效果，持续2000ms（2秒）
    // 参数：颜色（白色），持续时间（毫秒）
    camera.flash(2000, 255, 255, 255);
    
    // 更新状态信号
    flashCount++;
    flashText.setText(`Flash Count: ${flashCount} (Last key: ${key})`);
    
    console.log(`Camera flash triggered by key ${key}. Total flashes: ${flashCount}`);
  }
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

new Phaser.Game(config);