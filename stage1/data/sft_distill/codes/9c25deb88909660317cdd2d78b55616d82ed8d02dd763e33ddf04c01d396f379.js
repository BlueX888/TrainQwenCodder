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
  // 创建绿色三角形纹理
  const graphics = this.add.graphics();
  
  // 设置绿色填充
  graphics.fillStyle(0x00ff00, 1);
  
  // 绘制三角形（等边三角形）
  graphics.beginPath();
  graphics.moveTo(30, 0);      // 顶点
  graphics.lineTo(60, 52);     // 右下角
  graphics.lineTo(0, 52);      // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 60, 52);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，初始位置在左侧
  const triangle = this.add.sprite(100, 300, 'triangle');
  
  // 创建补间动画
  this.tweens.add({
    targets: triangle,           // 动画目标
    x: 700,                      // 目标 x 坐标（右侧）
    duration: 2500,              // 持续时间 2.5 秒
    ease: 'Linear',              // 线性缓动
    yoyo: true,                  // 往返效果（到达终点后反向播放）
    repeat: -1                   // 无限循环（-1 表示永久重复）
  });
  
  // 添加文字说明
  this.add.text(10, 10, 'Green Triangle Tween Animation\nMoving left-right in 2.5s loop', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);