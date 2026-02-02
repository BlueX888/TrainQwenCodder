const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create }
};

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制三角形
  const graphics = this.add.graphics();
  
  // 设置填充颜色为蓝色
  graphics.fillStyle(0x3498db, 1);
  
  // 绘制一个等边三角形（中心点为原点）
  const size = 100;
  graphics.fillTriangle(
    0, -size * 0.577,           // 顶点（上）
    -size * 0.5, size * 0.289,  // 左下顶点
    size * 0.5, size * 0.289    // 右下顶点
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', size, size);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建使用三角形纹理的 sprite，放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 创建缩放动画
  this.tweens.add({
    targets: triangle,           // 动画目标对象
    scaleX: 0.16,               // X轴缩放到16%
    scaleY: 0.16,               // Y轴缩放到16%
    duration: 2500,             // 持续时间2.5秒
    yoyo: true,                 // 往返播放（缩小后恢复原大小）
    loop: -1,                   // 无限循环（-1表示永久循环）
    ease: 'Linear'              // 线性缓动
  });
  
  // 添加提示文本
  this.add.text(400, 50, 'Triangle Scale Animation\n(2.5s to 16%, then back, loop)', {
    fontSize: '20px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
}

new Phaser.Game(config);