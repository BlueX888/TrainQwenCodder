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
  
  // 设置填充颜色为金黄色
  graphics.fillStyle(0xFFD700, 1);
  
  // 绘制星形（中心点在 100, 100，外半径 100，内半径 50，5个角）
  graphics.fillStar(100, 100, 5, 100, 50);
  
  // 生成纹理
  graphics.generateTexture('star', 200, 200);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 在屏幕中心创建星形精灵
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  this.tweens.add({
    targets: star,           // 动画目标对象
    scale: 0.64,            // 缩放到 64%（0.64 倍）
    duration: 3000,         // 持续时间 3 秒
    yoyo: true,             // 启用 yoyo 效果，动画结束后反向播放回到原始状态
    repeat: -1,             // 无限循环（-1 表示永久重复）
    ease: 'Sine.easeInOut'  // 使用正弦缓动函数，使动画更平滑
  });
}

new Phaser.Game(config);