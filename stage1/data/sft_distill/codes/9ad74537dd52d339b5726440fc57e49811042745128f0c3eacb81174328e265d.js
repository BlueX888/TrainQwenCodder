const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let square;
let pointer;
const FOLLOW_SPEED = 300; // 像素/秒

function preload() {
  // 使用 Graphics 生成粉色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xff69b4, 1); // 粉色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('pinkSquare', 50, 50);
  graphics.destroy();
}

function create() {
  // 创建粉色方块精灵，初始位置在屏幕中心
  square = this.add.sprite(400, 300, 'pinkSquare');
  
  // 获取指针对象
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, '移动鼠标，方块会跟随指针', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算方块到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    square.x,
    square.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于 1 像素，则移动方块
  if (distance > 1) {
    // 计算方块到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      square.x,
      square.y,
      pointer.x,
      pointer.y
    );
    
    // 计算本帧应移动的距离（速度 * 时间，delta 是毫秒需转换为秒）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于剩余距离，直接移动到目标位置
    if (moveDistance >= distance) {
      square.x = pointer.x;
      square.y = pointer.y;
    } else {
      // 根据角度和移动距离计算新位置
      square.x += Math.cos(angle) * moveDistance;
      square.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);