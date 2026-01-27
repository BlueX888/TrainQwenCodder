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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 在 (50, 50) 位置绘制半径为 50 的圆
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象
  
  // 创建精灵对象，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circleTexture');
  
  // 设置初始透明度为 0（完全透明）
  circle.setAlpha(0);
  
  // 创建透明度渐变动画
  this.tweens.add({
    targets: circle,           // 动画目标对象
    alpha: 1,                  // 目标透明度：完全不透明
    duration: 4000,            // 持续时间：4 秒（4000 毫秒）
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 启用 yoyo 效果：到达目标后反向播放
    loop: -1,                  // 无限循环播放（-1 表示永久循环）
    onLoop: function() {
      // 每次循环时的回调（可选，用于调试）
      console.log('Tween loop completed');
    }
  });
  
  // 添加文字说明
  this.add.text(400, 550, '圆形透明度循环渐变动画', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);