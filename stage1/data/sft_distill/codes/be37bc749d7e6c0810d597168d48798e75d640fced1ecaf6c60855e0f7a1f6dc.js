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

function preload() {
  // 使用 Graphics 生成矩形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillRect(0, 0, 150, 100);
  graphics.generateTexture('rectangle', 150, 100);
  graphics.destroy();
}

function create() {
  // 创建矩形精灵并居中显示
  const rectangle = this.add.sprite(400, 300, 'rectangle');
  
  // 添加文本说明
  this.add.text(400, 500, '矩形将在3秒内缩放到80%，然后恢复，循环播放', {
    fontSize: '18px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
  
  // 创建缩放动画
  this.tweens.add({
    targets: rectangle,           // 动画目标对象
    scaleX: 0.8,                  // X轴缩放到80%
    scaleY: 0.8,                  // Y轴缩放到80%
    duration: 3000,               // 持续时间3秒
    ease: 'Sine.easeInOut',       // 缓动函数，使动画更平滑
    yoyo: true,                   // 动画结束后反向播放（恢复到原始大小）
    loop: -1                      // 无限循环（-1表示永久循环）
  });
  
  // 添加调试信息显示当前缩放值
  const debugText = this.add.text(10, 10, '', {
    fontSize: '16px',
    color: '#00ff00'
  });
  
  // 每帧更新显示当前缩放值
  this.events.on('update', () => {
    debugText.setText(`当前缩放: ${rectangle.scaleX.toFixed(2)}`);
  });
}

new Phaser.Game(config);