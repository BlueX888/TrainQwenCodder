const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 使用 Graphics 生成圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(50, 50, 50); // 圆心在 (50, 50)，半径 50
  graphics.generateTexture('circle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建圆形精灵，放置在屏幕中心
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 创建缩放动画
  // yoyo: true 表示动画播放完后会反向播放回到初始状态
  // 总时长 1.5 秒 = 缩小 0.75 秒 + 恢复 0.75 秒
  this.tweens.add({
    targets: circle,
    scaleX: 0.64,
    scaleY: 0.64,
    duration: 750, // 单程时长 0.75 秒
    yoyo: true,    // 启用往返模式，自动恢复到原始大小
    loop: -1,      // -1 表示无限循环
    ease: 'Linear' // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Circle scaling animation (64% - 100%)', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);