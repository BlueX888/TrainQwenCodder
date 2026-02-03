const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色填充
  graphics.fillRect(0, 0, 150, 100); // 绘制 150x100 的矩形
  
  // 生成纹理
  graphics.generateTexture('rectangleTexture', 150, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为已经生成了纹理
  
  // 创建使用该纹理的 Sprite，放置在屏幕中央
  const rectangle = this.add.sprite(400, 300, 'rectangleTexture');
  
  // 创建缩放动画
  this.tweens.add({
    targets: rectangle,           // 动画目标对象
    scaleX: 0.8,                  // X轴缩放到 80%
    scaleY: 0.8,                  // Y轴缩放到 80%
    duration: 3000,               // 持续时间 3秒
    yoyo: true,                   // 启用往返效果（缩放到80%后自动恢复）
    loop: -1,                     // 无限循环（-1 表示永久循环）
    ease: 'Sine.easeInOut'        // 缓动函数，使动画更平滑
  });
  
  // 添加提示文本
  this.add.text(400, 50, '矩形缩放动画 (3秒循环)', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '矩形会在3秒内缩放到80%，然后恢复原始大小，循环播放', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);