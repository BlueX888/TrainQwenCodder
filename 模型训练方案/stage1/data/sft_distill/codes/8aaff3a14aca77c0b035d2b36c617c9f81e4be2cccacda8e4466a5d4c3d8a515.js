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
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 设置星形样式
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制星形（中心点在 100, 100，外半径 50，内半径 25，5 个角）
  graphics.fillStar(100, 100, 5, 25, 50, 0);
  
  // 生成纹理
  graphics.generateTexture('star', 200, 200);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建星形精灵，放置在屏幕中心
  const star = this.add.sprite(400, 300, 'star');
  
  // 设置初始透明度为 0（完全透明）
  star.setAlpha(0);
  
  // 创建渐变动画：从透明到不透明
  this.tweens.add({
    targets: star,           // 动画目标对象
    alpha: 1,                // 目标透明度值
    duration: 2500,          // 持续时间 2.5 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 反向播放（从 1 回到 0）
    repeat: -1               // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(400, 550, 'Star fading in and out (2.5s cycle)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);