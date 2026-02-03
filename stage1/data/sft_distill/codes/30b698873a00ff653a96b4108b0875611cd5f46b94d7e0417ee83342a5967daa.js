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
  // 使用 Graphics 绘制青色菱形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制菱形（使用 Path）
  const diamondSize = 50;
  const path = new Phaser.Geom.Path();
  
  // 菱形的四个顶点（中心在 50, 50）
  path.moveTo(diamondSize, 0);                    // 上顶点
  path.lineTo(diamondSize * 2, diamondSize);      // 右顶点
  path.lineTo(diamondSize, diamondSize * 2);      // 下顶点
  path.lineTo(0, diamondSize);                    // 左顶点
  path.closePath();                               // 闭合路径
  
  // 填充路径
  graphics.fillPath(path);
  
  // 生成纹理
  graphics.generateTexture('diamond', diamondSize * 2, diamondSize * 2);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建菱形精灵，初始位置在左侧
  const diamond = this.add.sprite(100, 300, 'diamond');
  
  // 创建补间动画
  this.tweens.add({
    targets: diamond,           // 动画目标
    x: 700,                     // 目标 x 坐标（右侧）
    duration: 3000,             // 持续时间 3 秒
    ease: 'Linear',             // 线性缓动
    yoyo: true,                 // 启用往返效果（到达终点后反向播放）
    repeat: -1                  // 无限循环（-1 表示永久重复）
  });
  
  // 添加提示文本
  this.add.text(400, 50, '青色菱形往返循环动画', {
    fontSize: '24px',
    color: '#00ffff',
    align: 'center'
  }).setOrigin(0.5);
  
  this.add.text(400, 550, '动画：3秒从左到右，然后往返循环', {
    fontSize: '16px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);