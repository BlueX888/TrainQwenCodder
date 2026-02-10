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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ff00, 1); // 绿色圆形
  graphics.fillCircle(50, 50, 50); // 半径为 50 的圆形
  graphics.generateTexture('circleTexture', 100, 100);
  graphics.destroy(); // 生成纹理后销毁 graphics 对象

  // 创建圆形精灵并居中显示
  const circle = this.add.sprite(400, 300, 'circleTexture');

  // 创建缩放动画
  // 1秒内从原始大小（scale: 1）缩放到 24%（scale: 0.24）
  // yoyo: true 表示动画结束后反向播放（恢复到原始大小）
  // duration: 1000 表示单程动画时长为 1 秒
  // loop: -1 表示无限循环
  this.tweens.add({
    targets: circle,
    scaleX: 0.24,
    scaleY: 0.24,
    duration: 1000, // 1秒缩小到24%
    yoyo: true,     // 动画结束后反向播放（恢复）
    loop: -1,       // 无限循环
    ease: 'Linear'  // 线性缓动
  });

  // 添加文本说明
  this.add.text(400, 50, 'Circle scaling animation\n1s to 24%, then restore, loop forever', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);