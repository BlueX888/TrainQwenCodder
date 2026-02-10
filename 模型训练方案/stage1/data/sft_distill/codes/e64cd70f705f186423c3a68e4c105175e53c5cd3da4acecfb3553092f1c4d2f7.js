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
  graphics.lineStyle(3, 0xffa500, 1); // 橙色边框
  
  // 绘制星形（中心点在 64, 64，外半径 64，内半径 32，5个角）
  graphics.fillStar(64, 64, 5, 64, 32, 0);
  graphics.strokeStar(64, 64, 5, 64, 32, 0);
  
  // 生成纹理
  graphics.generateTexture('star', 128, 128);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 创建星形精灵
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  this.tweens.add({
    targets: star,
    scaleX: 0.48,  // 缩放到 48%
    scaleY: 0.48,  // 缩放到 48%
    duration: 1500, // 持续 1.5 秒
    yoyo: true,     // 往返效果（缩小后再放大）
    repeat: -1,     // 无限循环
    ease: 'Sine.easeInOut' // 平滑的缓动效果
  });
  
  // 添加提示文本
  const text = this.add.text(400, 500, '星形缩放动画循环播放中', {
    fontSize: '24px',
    color: '#ffffff'
  });
  text.setOrigin(0.5);
}

// 启动游戏
new Phaser.Game(config);