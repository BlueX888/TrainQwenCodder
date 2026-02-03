const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态变量：记录相机抖动触发次数
let shakeCount = 0;
let statusText;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景网格，用于观察抖动效果
  const graphics = this.add.graphics();
  graphics.lineStyle(1, 0x444444, 0.8);
  
  // 绘制网格线
  for (let x = 0; x <= 800; x += 50) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, 600);
  }
  for (let y = 0; y <= 600; y += 50) {
    graphics.moveTo(0, y);
    graphics.lineTo(800, y);
  }
  graphics.strokePath();
  
  // 创建一些参考物体（圆形和矩形）
  const centerGraphics = this.add.graphics();
  centerGraphics.fillStyle(0xff6b6b, 1);
  centerGraphics.fillCircle(400, 300, 40);
  
  const rectGraphics = this.add.graphics();
  rectGraphics.fillStyle(0x4ecdc4, 1);
  rectGraphics.fillRect(200, 150, 100, 80);
  rectGraphics.fillRect(500, 400, 100, 80);
  
  // 添加提示文本
  const instructionText = this.add.text(400, 50, '右键点击触发相机抖动', {
    fontSize: '24px',
    color: '#ffffff',
    fontFamily: 'Arial'
  });
  instructionText.setOrigin(0.5);
  
  // 状态显示文本
  statusText = this.add.text(400, 550, `抖动触发次数: ${shakeCount}`, {
    fontSize: '20px',
    color: '#00ff00',
    fontFamily: 'Arial'
  });
  statusText.setOrigin(0.5);
  
  // 监听鼠标右键点击事件
  this.input.on('pointerdown', (pointer) => {
    // 检查是否为右键点击
    if (pointer.rightButtonDown()) {
      // 触发相机抖动效果
      // 参数：持续时间(ms), 强度, 是否强制重启
      this.cameras.main.shake(1500, 0.01, false);
      
      // 更新状态变量
      shakeCount++;
      statusText.setText(`抖动触发次数: ${shakeCount}`);
      
      console.log(`相机抖动已触发 (第 ${shakeCount} 次)`);
    }
  });
  
  // 监听抖动完成事件（可选，用于调试）
  this.cameras.main.on('camerashakecomplete', () => {
    console.log('相机抖动效果已完成');
  });
  
  // 添加左键点击提示
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      const hint = this.add.text(pointer.x, pointer.y, '请使用右键！', {
        fontSize: '16px',
        color: '#ff0000',
        fontFamily: 'Arial'
      });
      hint.setOrigin(0.5);
      
      // 1秒后移除提示
      this.time.delayedCall(1000, () => {
        hint.destroy();
      });
    }
  });
}

function update(time, delta) {
  // 本示例不需要每帧更新逻辑
}

// 启动游戏
new Phaser.Game(config);