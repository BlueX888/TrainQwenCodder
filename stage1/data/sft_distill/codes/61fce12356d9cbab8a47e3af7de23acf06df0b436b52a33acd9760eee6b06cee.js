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
  // 使用 Graphics 绘制圆形并生成纹理
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x00aaff, 1);
  
  // 绘制圆形（中心点在 50, 50，半径 50）
  graphics.fillCircle(50, 50, 50);
  
  // 生成纹理，名称为 'circle'，尺寸 100x100
  graphics.generateTexture('circle', 100, 100);
  
  // 销毁 graphics 对象（纹理已生成，不再需要）
  graphics.destroy();
  
  // 在屏幕中心创建圆形精灵
  const circle = this.add.sprite(400, 300, 'circle');
  
  // 设置初始透明度为 0（完全透明）
  circle.setAlpha(0);
  
  // 创建透明度渐变补间动画
  this.tweens.add({
    targets: circle,           // 动画目标对象
    alpha: 1,                  // 目标透明度值（完全不透明）
    duration: 4000,            // 持续时间 4 秒（4000 毫秒）
    ease: 'Linear',            // 线性缓动函数
    yoyo: false,               // 不反向播放
    repeat: -1,                // 无限循环（-1 表示永久重复）
    repeatDelay: 0             // 重复之间无延迟
  });
  
  // 添加文字说明
  this.add.text(400, 500, '圆形从透明到不透明（4秒循环）', {
    fontSize: '20px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);