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

let ellipse;
let pointer;
const FOLLOW_SPEED = 360; // 像素/秒

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 绘制灰色椭圆
  const graphics = this.add.graphics();
  graphics.fillStyle(0x808080, 1); // 灰色
  graphics.fillEllipse(30, 20, 60, 40); // 绘制椭圆 (中心x, 中心y, 宽度, 高度)
  
  // 生成纹理
  graphics.generateTexture('ellipseTex', 60, 40);
  graphics.destroy(); // 销毁 graphics 对象，只保留纹理
  
  // 创建椭圆精灵，初始位置在屏幕中心
  ellipse = this.add.sprite(400, 300, 'ellipseTex');
  
  // 获取鼠标指针引用
  pointer = this.input.activePointer;
}

function update(time, delta) {
  // 计算椭圆中心到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    ellipse.x,
    ellipse.y,
    pointer.x,
    pointer.y
  );
  
  // 计算移动距离（速度 * 时间）
  const moveDistance = FOLLOW_SPEED * (delta / 1000);
  
  // 只有当距离大于移动距离时才移动，避免抖动
  if (distance > moveDistance) {
    // 计算从椭圆到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      ellipse.x,
      ellipse.y,
      pointer.x,
      pointer.y
    );
    
    // 根据角度和速度移动椭圆
    ellipse.x += Math.cos(angle) * moveDistance;
    ellipse.y += Math.sin(angle) * moveDistance;
  } else {
    // 距离很近时直接对齐到鼠标位置
    ellipse.x = pointer.x;
    ellipse.y = pointer.y;
  }
}

new Phaser.Game(config);