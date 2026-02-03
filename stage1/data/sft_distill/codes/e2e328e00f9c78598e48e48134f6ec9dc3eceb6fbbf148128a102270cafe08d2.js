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
const FOLLOW_SPEED = 200; // 每秒移动的像素数

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制蓝色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0x0066ff, 1);
  
  // 绘制一个指向上方的三角形
  graphics.beginPath();
  graphics.moveTo(0, -20);  // 顶点
  graphics.lineTo(-15, 20);  // 左下角
  graphics.lineTo(15, 20);   // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 30, 40);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangleTexture');
  
  // 获取指针对象
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse to see the triangle follow', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算三角形到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    triangle.x,
    triangle.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素，则移动三角形
  if (distance > 1) {
    // 计算三角形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      triangle.x,
      triangle.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应该移动的距离（速度 * 时间）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接到达目标点
    if (moveDistance >= distance) {
      triangle.x = pointer.x;
      triangle.y = pointer.y;
    } else {
      // 根据角度和移动距离计算新位置
      triangle.x += Math.cos(angle) * moveDistance;
      triangle.y += Math.sin(angle) * moveDistance;
    }
    
    // 让三角形旋转指向鼠标方向（加90度因为三角形默认朝上）
    triangle.rotation = angle + Math.PI / 2;
  }
}

new Phaser.Game(config);