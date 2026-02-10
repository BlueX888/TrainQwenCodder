const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建一个星形游戏对象
  // Star(scene, x, y, points, innerRadius, outerRadius, fillColor)
  const star = this.add.star(
    400,           // x 位置（屏幕中心）
    300,           // y 位置（屏幕中心）
    5,             // 5 个角的星形
    20,            // 内半径
    50,            // 外半径
    0xffff00       // 黄色填充
  );

  // 添加描边效果使星形更明显
  star.setStrokeStyle(3, 0xffa500);

  // 创建缩放动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    scale: 0.16,            // 缩放到 16%（0.16 倍）
    duration: 1500,         // 动画持续时间 1.5 秒
    yoyo: true,             // 启用往返效果（缩小后再放大回原始大小）
    loop: -1,               // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });

  // 添加文字说明
  this.add.text(400, 500, '星形缩放动画循环播放', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);