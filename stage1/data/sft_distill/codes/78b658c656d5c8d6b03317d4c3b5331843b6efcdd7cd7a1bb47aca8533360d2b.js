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
  // 使用 Graphics 绘制红色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1); // 红色
  graphics.fillCircle(25, 25, 25); // 绘制半径为25的圆形
  
  // 生成纹理
  graphics.generateTexture('redCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建精灵对象，初始位置在左侧
  const circle = this.add.sprite(100, 300, 'redCircle');
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,           // 动画目标
    x: 700,                    // 目标 x 坐标（右侧位置）
    duration: 2500,            // 持续时间 2.5 秒
    ease: 'Linear',            // 线性缓动
    yoyo: true,                // 启用往返效果（到达终点后反向播放）
    repeat: -1                 // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(300, 50, '红色圆形左右往返循环', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);