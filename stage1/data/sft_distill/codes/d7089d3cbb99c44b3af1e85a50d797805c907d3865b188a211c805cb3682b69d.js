const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create
  }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 设置星形样式
  graphics.fillStyle(0xffff00, 1); // 黄色星形
  graphics.lineStyle(2, 0xffa500, 1); // 橙色描边
  
  // 绘制星形（5个角，外半径50，内半径20）
  const centerX = 50;
  const centerY = 50;
  graphics.fillStar(centerX, centerY, 5, 50, 20);
  graphics.strokeStar(centerX, centerY, 5, 50, 20);
  
  // 生成纹理
  graphics.generateTexture('star', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 在屏幕中心创建星形精灵
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  this.tweens.add({
    targets: star,           // 动画目标
    scale: 0.16,            // 缩放到 16%
    duration: 500,          // 持续时间 0.5 秒
    yoyo: true,             // 往返效果（缩小后再放大）
    loop: -1,               // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'  // 缓动函数，使动画更平滑
  });
  
  // 添加说明文字
  this.add.text(400, 550, '星形缩放动画循环播放中...', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);