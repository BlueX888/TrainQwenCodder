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
  // 无需预加载外部资源
}

function create() {
  // 创建 Graphics 对象绘制椭圆
  const graphics = this.add.graphics();
  
  // 设置填充样式为蓝色
  graphics.fillStyle(0x4a90e2, 1);
  
  // 绘制椭圆（中心位置 400, 300，横向半径 150，纵向半径 100）
  graphics.fillEllipse(400, 300, 150, 100);
  
  // 设置初始透明度为 0（完全透明）
  graphics.setAlpha(0);
  
  // 创建 Tween 动画，实现透明度渐变
  this.tweens.add({
    targets: graphics,           // 动画目标对象
    alpha: 1,                    // 目标透明度（完全不透明）
    duration: 1500,              // 动画时长 1.5 秒
    ease: 'Linear',              // 线性缓动
    yoyo: false,                 // 不使用来回效果
    repeat: -1,                  // 无限循环
    repeatDelay: 0,              // 重复间隔为 0
    onRepeat: function() {
      // 每次重复时重置透明度为 0
      graphics.setAlpha(0);
    }
  });
  
  // 添加文字说明
  this.add.text(400, 500, '椭圆透明度循环渐变动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);