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
  // 使用 Graphics 绘制矩形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色矩形
  graphics.fillRect(0, 0, 100, 100); // 100x100 的矩形
  
  // 生成纹理
  graphics.generateTexture('rectTexture', 100, 100);
  graphics.destroy(); // 销毁 graphics 对象，因为纹理已生成
  
  // 创建 Sprite 对象并居中显示
  const rect = this.add.sprite(400, 300, 'rectTexture');
  
  // 添加缩放动画
  this.tweens.add({
    targets: rect,           // 动画目标对象
    scaleX: 0.48,           // X 轴缩放到 48%
    scaleY: 0.48,           // Y 轴缩放到 48%
    duration: 3000,         // 动画持续时间 3 秒
    yoyo: true,             // 动画结束后反向播放（恢复原始大小）
    loop: -1,               // 无限循环（-1 表示永久循环）
    ease: 'Linear'          // 线性缓动效果
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Rectangle scaling to 48% and back\nLooping infinitely', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);