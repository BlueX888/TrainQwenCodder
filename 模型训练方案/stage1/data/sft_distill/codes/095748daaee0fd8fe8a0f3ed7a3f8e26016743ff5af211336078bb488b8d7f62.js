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
  // 创建 Graphics 对象绘制三角形
  const graphics = this.add.graphics();
  
  // 设置青色填充
  graphics.fillStyle(0x00ffff, 1);
  
  // 绘制三角形（等边三角形，中心在原点）
  const size = 60;
  const height = size * Math.sqrt(3) / 2;
  graphics.fillTriangle(
    0, -height * 2/3,           // 顶点
    -size/2, height * 1/3,      // 左下
    size/2, height * 1/3        // 右下
  );
  
  // 生成纹理
  graphics.generateTexture('triangle', size, size * 1.2);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
  
  // 创建精灵并放置在屏幕中心
  const triangle = this.add.sprite(400, 300, 'triangle');
  
  // 添加旋转动画
  this.tweens.add({
    targets: triangle,
    angle: 360,           // 旋转360度
    duration: 1000,       // 持续1秒
    ease: 'Linear',       // 线性缓动
    repeat: -1,           // 无限循环（-1表示永久重复）
    yoyo: false           // 不需要来回效果
  });
}

new Phaser.Game(config);