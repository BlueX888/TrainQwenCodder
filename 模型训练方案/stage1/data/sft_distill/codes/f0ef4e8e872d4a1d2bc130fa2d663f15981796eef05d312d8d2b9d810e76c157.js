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
  // 使用 Graphics 生成粉色圆形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(25, 25, 25); // 在 (25, 25) 位置绘制半径 25 的圆
  
  // 生成纹理，尺寸为 50x50
  graphics.generateTexture('pinkCircle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建粉色圆形精灵，初始位置在左侧
  const circle = this.add.sprite(100, 300, 'pinkCircle');
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,        // 动画目标对象
    x: 700,                 // 目标 x 坐标（右侧位置）
    duration: 4000,         // 持续时间 4 秒
    ease: 'Linear',         // 线性缓动
    yoyo: true,             // 启用往返效果（到达终点后反向播放）
    repeat: -1              // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Pink Circle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, 'The circle moves left-right in 4 seconds loop', {
    fontSize: '16px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

new Phaser.Game(config);