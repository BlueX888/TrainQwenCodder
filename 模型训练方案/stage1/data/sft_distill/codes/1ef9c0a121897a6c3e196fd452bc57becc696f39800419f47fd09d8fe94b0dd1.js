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
  // 不需要加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置椭圆的中心位置
  const centerX = 400;
  const centerY = 300;
  const radiusX = 120; // 椭圆横向半径
  const radiusY = 80;  // 椭圆纵向半径
  
  // 绘制填充椭圆
  graphics.fillStyle(0x00aaff, 1);
  graphics.fillEllipse(centerX, centerY, radiusX, radiusY);
  
  // 设置椭圆的原点为中心，方便缩放
  graphics.x = 0;
  graphics.y = 0;
  
  // 创建缩放动画
  this.tweens.add({
    targets: graphics,
    scaleX: 0.24,  // 缩放到 24%
    scaleY: 0.24,  // 缩放到 24%
    duration: 2000, // 单程持续 2 秒
    yoyo: true,     // 往返播放（2秒缩小 + 2秒恢复 = 4秒完整周期）
    loop: -1,       // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 50, 'Ellipse Scale Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'Scaling from 100% to 24% and back in 4 seconds (looping)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);