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
  // 使用 Graphics 绘制红色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff0000, 1);
  
  // 绘制一个等边三角形（顶点朝上）
  graphics.beginPath();
  graphics.moveTo(0, -20);    // 顶点
  graphics.lineTo(-17, 10);   // 左下角
  graphics.lineTo(17, 10);    // 右下角
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTexture', 34, 30);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangleTexture');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算三角形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    triangle.x,
    triangle.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于1像素，才进行移动（避免抖动）
  if (distance > 1) {
    // 计算移动角度
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
      // 根据角度和速度更新位置
      triangle.x += Math.cos(angle) * moveDistance;
      triangle.y += Math.sin(angle) * moveDistance;
    }
    
    // 让三角形旋转朝向鼠标方向
    triangle.rotation = angle + Math.PI / 2; // +90度使顶点朝向移动方向
  }
}

new Phaser.Game(config);