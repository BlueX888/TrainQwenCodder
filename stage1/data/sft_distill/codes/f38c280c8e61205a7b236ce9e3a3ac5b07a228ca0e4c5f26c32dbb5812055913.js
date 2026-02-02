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
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制白色星形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为白色
  graphics.fillStyle(0xffffff, 1);
  
  // 绘制星形（中心点在 40, 40，外半径 40，内半径 20，5个角）
  graphics.fillStar(40, 40, 5, 20, 40);
  
  // 生成纹理
  graphics.generateTexture('star', 80, 80);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建星形精灵，初始位置在左侧
  const star = this.add.sprite(100, 300, 'star');
  
  // 创建补间动画
  this.tweens.add({
    targets: star,           // 动画目标
    x: 700,                  // 目标 x 坐标（右侧）
    duration: 2000,          // 持续时间 2 秒
    ease: 'Linear',          // 线性缓动
    yoyo: true,              // 往返效果（到达终点后反向播放）
    repeat: -1               // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(400, 100, '星形左右往返循环移动', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
}

new Phaser.Game(config);