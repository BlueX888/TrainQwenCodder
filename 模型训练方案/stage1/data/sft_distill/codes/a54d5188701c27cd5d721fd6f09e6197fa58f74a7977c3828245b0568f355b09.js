const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let triangle;
let pointer;
const FOLLOW_SPEED = 200;

function preload() {
  // 使用 Graphics 创建蓝色三角形纹理
  const graphics = this.make.graphics({ x: 0, y: 0, add: false });
  
  // 绘制一个指向上方的三角形
  graphics.fillStyle(0x0088ff, 1);
  graphics.beginPath();
  graphics.moveTo(25, 0);      // 顶点
  graphics.lineTo(50, 50);     // 右下角
  graphics.lineTo(0, 50);      // 左下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangle', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建三角形精灵，初始位置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangle');
  triangle.setOrigin(0.5, 0.5);
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加视觉提示文本
  this.add.text(10, 10, 'Move your mouse - Triangle follows at speed 200', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算三角形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    triangle.x,
    triangle.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于一个很小的阈值时才移动（避免抖动）
  if (distance > 1) {
    // 计算从三角形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      triangle.x,
      triangle.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应该移动的距离（速度 * 时间差，delta 单位是毫秒）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果本帧移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      triangle.x = pointer.x;
      triangle.y = pointer.y;
    } else {
      // 根据角度和移动距离计算新位置
      triangle.x += Math.cos(angle) * moveDistance;
      triangle.y += Math.sin(angle) * moveDistance;
    }
    
    // 让三角形旋转朝向鼠标方向（加 PI/2 因为三角形默认朝上）
    triangle.rotation = angle + Math.PI / 2;
  }
}

new Phaser.Game(config);