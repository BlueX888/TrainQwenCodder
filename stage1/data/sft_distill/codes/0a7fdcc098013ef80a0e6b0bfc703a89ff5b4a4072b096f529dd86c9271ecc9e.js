const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

// 状态变量
let shakeCompleted = false;
let shakeStartTime = 0;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 记录抖动开始时间
  shakeStartTime = Date.now();
  
  // 创建背景网格以便更好地观察抖动效果
  const graphics = this.add.graphics();
  
  // 绘制网格
  graphics.lineStyle(1, 0x00ff00, 0.3);
  for (let x = 0; x <= 800; x += 50) {
    graphics.lineBetween(x, 0, x, 600);
  }
  for (let y = 0; y <= 600; y += 50) {
    graphics.lineBetween(0, y, 800, y);
  }
  
  // 绘制一些参考对象
  const centerGraphics = this.add.graphics();
  
  // 中心大圆
  centerGraphics.fillStyle(0xff6b6b, 1);
  centerGraphics.fillCircle(400, 300, 80);
  
  // 四个角的小方块
  centerGraphics.fillStyle(0x4ecdc4, 1);
  centerGraphics.fillRect(50, 50, 60, 60);
  centerGraphics.fillRect(690, 50, 60, 60);
  centerGraphics.fillRect(50, 490, 60, 60);
  centerGraphics.fillRect(690, 490, 60, 60);
  
  // 添加标题文本
  const titleText = this.add.text(400, 150, 'Camera Shake Effect', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 4
  }).setOrigin(0.5);
  
  // 添加状态文本
  const statusText = this.add.text(400, 400, 'Shaking...', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffff00',
    stroke: '#000000',
    strokeThickness: 3
  }).setOrigin(0.5);
  
  // 添加计时文本
  const timerText = this.add.text(400, 450, 'Duration: 0.0s', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 获取主相机
  const camera = this.cameras.main;
  
  // 启动相机抖动效果
  // 参数：持续时间(ms), 强度(默认0.05), 是否强制(默认true), 回调函数, 回调上下文
  camera.shake(1000, 0.01);
  
  // 监听抖动完成事件
  camera.once('camerashakecomplete', function(camera) {
    shakeCompleted = true;
    const duration = ((Date.now() - shakeStartTime) / 1000).toFixed(2);
    
    statusText.setText('Shake Completed!');
    statusText.setColor('#00ff00');
    timerText.setText(`Duration: ${duration}s`);
    
    // 添加完成提示动画
    scene.tweens.add({
      targets: statusText,
      scaleX: 1.2,
      scaleY: 1.2,
      yoyo: true,
      duration: 200,
      repeat: 2
    });
    
    console.log('Camera shake completed after', duration, 'seconds');
  });
  
  // 实时更新计时器
  this.time.addEvent({
    delay: 100,
    callback: function() {
      if (!shakeCompleted) {
        const elapsed = ((Date.now() - shakeStartTime) / 1000).toFixed(1);
        timerText.setText(`Duration: ${elapsed}s / 1.0s`);
      }
    },
    loop: true
  });
  
  // 添加说明文本
  const infoText = this.add.text(400, 550, 'The camera will shake for 1 second', {
    fontSize: '14px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  }).setOrigin(0.5);
  
  // 添加重启按钮区域（点击重新触发抖动）
  const restartButton = this.add.graphics();
  restartButton.fillStyle(0x5555ff, 1);
  restartButton.fillRoundedRect(325, 480, 150, 40, 10);
  
  const restartText = this.add.text(400, 500, 'Shake Again', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 设置交互区域
  restartButton.setInteractive(
    new Phaser.Geom.Rectangle(325, 480, 150, 40),
    Phaser.Geom.Rectangle.Contains
  );
  
  restartButton.on('pointerdown', function() {
    if (shakeCompleted) {
      shakeCompleted = false;
      shakeStartTime = Date.now();
      statusText.setText('Shaking...');
      statusText.setColor('#ffff00');
      statusText.setScale(1);
      
      camera.shake(1000, 0.01);
      
      camera.once('camerashakecomplete', function() {
        shakeCompleted = true;
        const duration = ((Date.now() - shakeStartTime) / 1000).toFixed(2);
        statusText.setText('Shake Completed!');
        statusText.setColor('#00ff00');
        timerText.setText(`Duration: ${duration}s`);
      });
    }
  });
  
  restartButton.on('pointerover', function() {
    restartButton.clear();
    restartButton.fillStyle(0x7777ff, 1);
    restartButton.fillRoundedRect(325, 480, 150, 40, 10);
  });
  
  restartButton.on('pointerout', function() {
    restartButton.clear();
    restartButton.fillStyle(0x5555ff, 1);
    restartButton.fillRoundedRect(325, 480, 150, 40, 10);
  });
  
  // 输出状态信息到控制台
  console.log('Camera shake started');
  console.log('Shake completed status:', shakeCompleted);
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量供外部验证
if (typeof window !== 'undefined') {
  window.gameState = {
    getShakeCompleted: () => shakeCompleted,
    getShakeStartTime: () => shakeStartTime
  };
}