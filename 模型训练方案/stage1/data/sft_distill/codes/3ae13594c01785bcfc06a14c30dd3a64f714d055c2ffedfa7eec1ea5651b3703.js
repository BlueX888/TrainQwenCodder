const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态信号变量
let shakeCount = 0;
let isShaking = false;
let statusText;
let spaceKey;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建背景网格以便观察相机效果
  const graphics = this.add.graphics();
  
  // 绘制网格
  graphics.lineStyle(1, 0x00ff00, 0.3);
  for (let x = 0; x < 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y < 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 创建一些彩色方块作为参考物
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
  for (let i = 0; i < 6; i++) {
    const rect = this.add.graphics();
    rect.fillStyle(colors[i], 1);
    rect.fillRect(0, 0, 60, 60);
    rect.x = 100 + (i % 3) * 250;
    rect.y = 150 + Math.floor(i / 3) * 250;
  }
  
  // 创建中心标题
  const titleText = this.add.text(400, 50, 'CAMERA SHAKE DEMO', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
  
  // 创建提示文本
  const hintText = this.add.text(400, 100, 'Press SPACE to shake camera', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
  hintText.setOrigin(0.5);
  
  // 创建状态显示文本
  statusText = this.add.text(400, 550, `Shake Count: ${shakeCount} | Status: Idle`, {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#ffff00'
  });
  statusText.setOrigin(0.5);
  
  // 监听空格键
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  
  // 监听空格键按下事件
  spaceKey.on('down', () => {
    if (!isShaking) {
      triggerCameraShake.call(this);
    }
  });
}

function triggerCameraShake() {
  // 触发相机弹跳效果，持续 2500ms (2.5秒)
  this.cameras.main.shake(2500, 0.01);
  
  // 更新状态
  shakeCount++;
  isShaking = true;
  statusText.setText(`Shake Count: ${shakeCount} | Status: Shaking...`);
  
  // 监听相机震动完成事件
  this.cameras.main.once('camerashakecomplete', () => {
    isShaking = false;
    statusText.setText(`Shake Count: ${shakeCount} | Status: Idle`);
  });
  
  // 在控制台输出状态信号
  console.log(`Camera shake triggered! Total count: ${shakeCount}`);
}

function update(time, delta) {
  // 可选：添加视觉反馈，当正在震动时改变状态文本颜色
  if (isShaking) {
    const alpha = Math.sin(time / 100) * 0.5 + 0.5;
    statusText.setAlpha(alpha);
  } else {
    statusText.setAlpha(1);
  }
}

new Phaser.Game(config);