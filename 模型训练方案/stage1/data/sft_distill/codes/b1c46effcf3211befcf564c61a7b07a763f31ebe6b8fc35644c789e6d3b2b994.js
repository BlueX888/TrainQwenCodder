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
  // 使用 Graphics 绘制青色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  graphics.fillCircle(25, 25, 25); // 绘制半径为25的圆形
  
  // 生成纹理
  graphics.generateTexture('cyanCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，因为纹理已生成
  
  // 创建精灵对象
  const circle = this.add.sprite(100, 300, 'cyanCircle');
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,           // 动画目标对象
    x: 700,                    // 目标 x 坐标（右侧位置）
    duration: 500,             // 持续时间 0.5 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 启用往返效果（到达终点后反向播放）
    repeat: -1                 // 无限循环（-1 表示永久重复）
  });
  
  // 添加说明文字
  this.add.text(400, 50, '青色圆形左右往返循环动画', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);