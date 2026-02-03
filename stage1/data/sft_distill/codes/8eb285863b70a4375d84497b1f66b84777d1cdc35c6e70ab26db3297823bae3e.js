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
  // 使用 Graphics 绘制星形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为黄色
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制星形 (x, y, points, innerRadius, outerRadius)
  // 中心点设置在 (64, 64)，方便后续居中对齐
  graphics.fillStar(64, 64, 5, 30, 60);
  
  // 生成纹理
  graphics.generateTexture('star', 128, 128);
  
  // 销毁 graphics 对象，因为已经生成了纹理
  graphics.destroy();
  
  // 创建星形精灵，放置在屏幕中心
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    scaleX: 0.64,           // X 轴缩放到 64%
    scaleY: 0.64,           // Y 轴缩放到 64%
    duration: 3000,         // 持续时间 3 秒
    yoyo: true,             // 启用 yoyo 效果，动画结束后反向播放回到原始状态
    loop: -1,               // 无限循环 (-1 表示永久循环)
    ease: 'Sine.easeInOut'  // 使用平滑的缓动函数
  });
  
  // 添加提示文本
  this.add.text(400, 550, 'Star scaling animation: 100% -> 64% -> 100% (loop)', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);