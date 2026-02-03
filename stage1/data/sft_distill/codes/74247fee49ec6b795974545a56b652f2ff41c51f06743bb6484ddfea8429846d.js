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
  // 使用 Graphics 绘制红色星形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制五角星
  // 参数：x, y, points(角数), innerRadius(内半径), outerRadius(外半径)
  graphics.fillStar(64, 64, 5, 25, 50);
  
  // 生成纹理
  graphics.generateTexture('redStar', 128, 128);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建星形精灵，放置在屏幕中央
  const star = this.add.sprite(400, 300, 'redStar');
  
  // 创建淡入淡出动画
  // 使用 yoyo 实现从 1 -> 0 -> 1 的效果
  this.tweens.add({
    targets: star,           // 动画目标对象
    alpha: 0,                // 目标 alpha 值（从当前的 1 变到 0）
    duration: 250,           // 单程持续时间 0.25 秒（淡出）
    yoyo: true,              // 启用 yoyo 效果（淡出后自动淡入）
    repeat: -1,              // 无限循环
    ease: 'Linear'           // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 500, 'Red star fading in and out (0.5s cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);