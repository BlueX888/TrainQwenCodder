const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let triangle;
let pointer;
const FOLLOW_SPEED = 200;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制红色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制一个等腰三角形（顶点朝上）
  graphics.beginPath();
  graphics.moveTo(0, -20);  // 顶点
  graphics.lineTo(-15, 20); // 左下角
  graphics.lineTo(15, 20);  // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 30, 40);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 获取指针对象
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse, the red triangle will follow!', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 获取鼠标位置
  const mouseX = pointer.x;
  const mouseY = pointer.y;
  
  // 计算三角形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    triangle.x,
    triangle.y,
    mouseX,
    mouseY
  );
  
  // 只有当距离大于一定阈值时才移动（避免抖动）
  if (distance > 5) {
    // 计算移动角度
    const angle = Phaser.Math.Angle.Between(
      triangle.x,
      triangle.y,
      mouseX,
      mouseY
    );
    
    // 计算本帧应该移动的距离（速度 * 时间差，delta 单位是毫秒）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果本帧移动距离小于实际距离，则按速度移动
    // 否则直接移动到目标位置（避免超过目标）
    if (moveDistance < distance) {
      triangle.x += Math.cos(angle) * moveDistance;
      triangle.y += Math.sin(angle) * moveDistance;
    } else {
      triangle.x = mouseX;
      triangle.y = mouseY;
    }
    
    // 让三角形旋转朝向鼠标方向（加 90 度因为三角形初始朝上）
    triangle.rotation = angle + Math.PI / 2;
  }
}

new Phaser.Game(config);