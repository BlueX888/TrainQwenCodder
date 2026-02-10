const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号对象，用于验证
window.__signals__ = {
  shakeCount: 0,
  shakeEvents: []
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 绘制背景网格，便于观察相机弹跳效果
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.5);
  
  // 绘制垂直线
  for (let x = 0; x <= 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  
  // 绘制水平线
  for (let y = 0; y <= 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制中心标记
  const centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0xff0000, 1);
  centerGraphics.fillCircle(400, 300, 10);
  centerGraphics.lineStyle(2, 0xff0000, 1);
  centerGraphics.lineBetween(400, 250, 400, 350);
  centerGraphics.lineBetween(350, 300, 450, 300);
  
  // 添加提示文本
  const instructionText = this.add.text(400, 50, 
    '按方向键触发相机弹跳效果\n↑ ↓ ← →', 
    {
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      fontFamily: 'Arial'
    }
  ).setOrigin(0.5);
  
  // 显示触发次数
  const countText = this.add.text(400, 550, 
    '弹跳触发次数: 0', 
    {
      fontSize: '20px',
      color: '#00ff00',
      fontFamily: 'Arial'
    }
  ).setOrigin(0.5);
  
  // 显示最后触发方向
  const directionText = this.add.text(400, 520, 
    '最后触发方向: -', 
    {
      fontSize: '18px',
      color: '#ffff00',
      fontFamily: 'Arial'
    }
  ).setOrigin(0.5);
  
  // 获取方向键
  const cursors = this.input.keyboard.createCursorKeys();
  
  // 添加额外的键盘监听（WASD）
  const keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
  const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
  const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
  
  // 触发相机弹跳的函数
  function triggerShake(direction) {
    // 相机弹跳效果：持续1000ms（1秒），强度0.01
    scene.cameras.main.shake(1000, 0.01);
    
    // 记录信号
    window.__signals__.shakeCount++;
    window.__signals__.shakeEvents.push({
      direction: direction,
      timestamp: Date.now(),
      duration: 1000
    });
    
    // 更新显示
    countText.setText(`弹跳触发次数: ${window.__signals__.shakeCount}`);
    directionText.setText(`最后触发方向: ${direction}`);
    
    // 输出日志 JSON
    console.log(JSON.stringify({
      event: 'camera_shake',
      direction: direction,
      count: window.__signals__.shakeCount,
      timestamp: Date.now()
    }));
  }
  
  // 监听方向键按下事件
  cursors.up.on('down', () => triggerShake('UP'));
  cursors.down.on('down', () => triggerShake('DOWN'));
  cursors.left.on('down', () => triggerShake('LEFT'));
  cursors.right.on('down', () => triggerShake('RIGHT'));
  
  // 监听 WASD 按键
  keyW.on('down', () => triggerShake('UP (W)'));
  keyA.on('down', () => triggerShake('LEFT (A)'));
  keyS.on('down', () => triggerShake('DOWN (S)'));
  keyD.on('down', () => triggerShake('RIGHT (D)'));
  
  // 添加相机弹跳完成事件监听
  this.cameras.main.on('camerashakecomplete', () => {
    console.log(JSON.stringify({
      event: 'camera_shake_complete',
      timestamp: Date.now()
    }));
  });
}

function update(time, delta) {
  // 无需每帧更新逻辑
}

new Phaser.Game(config);