const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 创建紫色圆形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9932cc, 1); // 紫色
  graphics.fillCircle(50, 50, 50); // 绘制半径50的圆形
  graphics.generateTexture('purpleCircle', 100, 100);
  graphics.destroy();
}

function create() {
  // 创建紫色圆形精灵
  const circle = this.add.sprite(400, 300, 'purpleCircle');
  
  // 创建闪烁动画
  // 通过改变 alpha 透明度实现闪烁效果
  this.tweens.add({
    targets: circle,
    alpha: 0.2, // 从 1 淡化到 0.2
    duration: 750, // 单程时间 750ms
    yoyo: true, // 来回播放（淡出后再淡入）
    repeat: -1, // 无限循环
    ease: 'Sine.easeInOut' // 使用正弦缓动使效果更平滑
  });
  
  // 添加提示文字
  this.add.text(400, 500, '紫色圆形闪烁动画 (1.5秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);