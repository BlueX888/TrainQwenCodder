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
  // 使用 Graphics 绘制粉色圆形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillCircle(25, 25, 25); // 绘制半径为25的圆形
  
  // 生成纹理
  graphics.generateTexture('pinkCircle', 50, 50);
  graphics.destroy(); // 销毁 graphics 对象，纹理已生成
  
  // 创建精灵对象
  const circle = this.add.sprite(100, 300, 'pinkCircle');
  
  // 创建补间动画
  this.tweens.add({
    targets: circle,           // 动画目标对象
    x: 700,                    // 目标 x 坐标（右侧位置）
    duration: 4000,            // 单程持续时间 4 秒
    yoyo: true,                // 启用往返效果（到达终点后返回起点）
    loop: -1,                  // 无限循环（-1 表示永久循环）
    ease: 'Linear'             // 线性缓动，匀速移动
  });
  
  // 添加提示文本
  this.add.text(300, 50, 'Pink Circle Tween Animation', {
    fontSize: '24px',
    color: '#ffffff'
  });
}

new Phaser.Game(config);