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

let triangleCount = 0;
const MAX_TRIANGLES = 20;
let timerEvent = null;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 重置计数器
  triangleCount = 0;
  
  // 使用Graphics创建青色三角形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x00ffff, 1); // 青色
  
  // 绘制一个等边三角形（顶点朝上）
  graphics.beginPath();
  graphics.moveTo(0, -20);      // 顶点
  graphics.lineTo(-20, 20);     // 左下
  graphics.lineTo(20, 20);      // 右下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 40, 40);
  graphics.destroy(); // 销毁graphics对象，纹理已生成
  
  // 添加提示文本
  this.add.text(10, 10, '每1.5秒生成一个青色三角形（最多20个）', {
    fontSize: '16px',
    color: '#ffffff'
  });
  
  // 添加计数文本
  const countText = this.add.text(10, 40, `三角形数量: 0 / ${MAX_TRIANGLES}`, {
    fontSize: '18px',
    color: '#00ffff'
  });
  
  // 创建定时事件，每1.5秒生成一个三角形
  timerEvent = this.time.addEvent({
    delay: 1500,              // 1.5秒 = 1500毫秒
    callback: spawnTriangle,
    callbackScope: this,
    loop: true,
    args: [countText]
  });
  
  // 立即生成第一个三角形
  spawnTriangle.call(this, countText);
}

function spawnTriangle(countText) {
  // 检查是否达到最大数量
  if (triangleCount >= MAX_TRIANGLES) {
    if (timerEvent) {
      timerEvent.remove(); // 停止定时器
      timerEvent = null;
    }
    
    // 显示完成提示
    this.add.text(400, 300, '已生成全部20个三角形！', {
      fontSize: '24px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    
    return;
  }
  
  // 生成随机位置（确保三角形完全在画布内）
  const margin = 30; // 边距
  const randomX = Phaser.Math.Between(margin, 800 - margin);
  const randomY = Phaser.Math.Between(margin, 600 - margin);
  
  // 创建三角形精灵
  const triangle = this.add.image(randomX, randomY, 'triangleTexture');
  
  // 添加一些视觉效果：随机旋转
  triangle.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
  
  // 添加淡入动画
  triangle.setAlpha(0);
  this.tweens.add({
    targets: triangle,
    alpha: 1,
    duration: 300,
    ease: 'Power2'
  });
  
  // 增加计数
  triangleCount++;
  
  // 更新计数文本
  countText.setText(`三角形数量: ${triangleCount} / ${MAX_TRIANGLES}`);
}

// 创建游戏实例
new Phaser.Game(config);