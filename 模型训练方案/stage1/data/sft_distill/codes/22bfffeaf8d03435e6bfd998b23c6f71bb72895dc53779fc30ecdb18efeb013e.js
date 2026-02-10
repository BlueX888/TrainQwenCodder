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
  // 创建星形纹理
  const graphics = this.add.graphics();
  
  // 绘制黄色星形
  graphics.fillStyle(0xffff00, 1);
  graphics.fillStar(64, 64, 5, 32, 64, 0);
  
  // 生成纹理
  graphics.generateTexture('star', 128, 128);
  graphics.destroy();
}

function create() {
  // 在屏幕中心创建星形精灵
  const star = this.add.sprite(400, 300, 'star');
  
  // 创建缩放动画
  this.tweens.add({
    targets: star,
    scaleX: 0.64,
    scaleY: 0.64,
    duration: 500,  // 0.5 秒
    yoyo: true,     // 动画结束后反向播放回到原始状态
    loop: -1,       // -1 表示无限循环
    ease: 'Sine.easeInOut'  // 使用平滑的缓动效果
  });
}

new Phaser.Game(config);