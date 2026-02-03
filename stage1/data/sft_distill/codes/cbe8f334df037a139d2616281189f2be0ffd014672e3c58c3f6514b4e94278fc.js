const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

let player;
let pointer;
const FOLLOW_SPEED = 300;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 使用 Graphics 创建黄色方块纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  graphics.fillRect(0, 0, 50, 50);
  graphics.generateTexture('yellowSquare', 50, 50);
  graphics.destroy();

  // 创建物理精灵作为玩家方块
  player = this.physics.add.sprite(400, 300, 'yellowSquare');
  player.setCollideWorldBounds(true);
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move mouse to guide the yellow square', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算方块中心到鼠标指针的距离
  const distance = Phaser.Math.Distance.Between(
    player.x,
    player.y,
    pointer.x,
    pointer.y
  );
  
  // 如果距离大于一个阈值才移动，避免抖动
  if (distance > 5) {
    // 计算从方块到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      player.x,
      player.y,
      pointer.x,
      pointer.y
    );
    
    // 根据角度设置速度分量
    const velocityX = Math.cos(angle) * FOLLOW_SPEED;
    const velocityY = Math.sin(angle) * FOLLOW_SPEED;
    
    player.setVelocity(velocityX, velocityY);
  } else {
    // 距离很近时停止移动
    player.setVelocity(0, 0);
  }
}

new Phaser.Game(config);