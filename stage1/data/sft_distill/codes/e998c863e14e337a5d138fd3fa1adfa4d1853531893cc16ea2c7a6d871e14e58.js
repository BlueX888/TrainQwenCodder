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
  // 不需要预加载外部资源
}

function create() {
  // 创建青色椭圆
  const ellipse = this.add.graphics();
  ellipse.fillStyle(0x00ffff, 1); // 青色
  ellipse.fillEllipse(0, 0, 100, 60); // 在原点绘制椭圆，宽100，高60
  
  // 将椭圆放置在屏幕中心
  ellipse.x = 400;
  ellipse.y = 300;
  
  // 创建缩放动画
  this.tweens.add({
    targets: ellipse,
    scaleX: 1.5,  // 水平缩放到1.5倍
    scaleY: 1.5,  // 垂直缩放到1.5倍
    duration: 1000, // 缩放动画持续1秒
    yoyo: true,    // 启用yoyo模式，动画会反向播放回到初始状态
    repeat: -1,    // 无限循环
    ease: 'Sine.easeInOut' // 使用平滑的缓动函数
  });
  
  // 添加文字说明
  this.add.text(400, 50, '青色椭圆缩放动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '2秒完成一次缩放循环 (1秒放大 + 1秒缩小)', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);