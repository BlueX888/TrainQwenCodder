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
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 设置星形样式
  graphics.fillStyle(0xffff00, 1); // 黄色填充
  graphics.lineStyle(3, 0xffa500, 1); // 橙色描边
  
  // 绘制星形（中心点在 64, 64，外半径 60，内半径 30，5个角）
  graphics.fillStar(64, 64, 5, 30, 60, 0);
  graphics.strokeStar(64, 64, 5, 30, 60, 0);
  
  // 生成纹理
  graphics.generateTexture('star', 128, 128);
  
  // 清除 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建星形精灵，放置在屏幕中心
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    scaleX: 0.48,           // X轴缩放到48%
    scaleY: 0.48,           // Y轴缩放到48%
    duration: 1500,         // 持续时间1.5秒
    ease: 'Sine.easeInOut', // 缓动函数，使动画更平滑
    yoyo: true,             // 启用往返效果（缩放到48%后自动恢复）
    loop: -1                // 无限循环（-1表示永久循环）
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Star scaling animation (48% - 100%)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);