class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.moveSpeed = 160;
    this.totalDistance = 0; // 可验证的状态信号：总移动距离
    this.objectsMoving = 0; // 可验证的状态信号：移动次数
  }

  preload() {
    // 使用 Graphics 创建粉色圆形纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xff69b4, 1); // 粉色
    graphics.fillCircle(25, 25, 25); // 半径25的圆形
    graphics.generateTexture('pinkCircle', 50, 50);
    graphics.destroy();
  }

  create() {
    // 创建5个粉色对象
    this.pinkObjects = [];
    
    // 在屏幕中间区域创建5个对象，排列成十字形
    const centerX = 400;
    const centerY = 300;
    const spacing = 100;
    
    const positions = [
      { x: centerX, y: centerY }, // 中心
      { x: centerX - spacing, y: centerY }, // 左
      { x: centerX + spacing, y: centerY }, // 右
      { x: centerX, y: centerY - spacing }, // 上
      { x: centerX, y: centerY + spacing }  // 下
    ];
    
    positions.forEach((pos, index) => {
      const obj = this.add.sprite(pos.x, pos.y, 'pinkCircle');
      obj.setData('id', index); // 设置ID用于调试
      this.pinkObjects.push(obj);
    });
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加文本显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateStatusText();
    
    console.log('Game initialized: 5 pink objects created');
    console.log('Use arrow keys to move all objects simultaneously');
  }

  update(time, delta) {
    // 计算移动向量
    let velocityX = 0;
    let velocityY = 0;
    let isMoving = false;
    
    if (this.cursors.left.isDown) {
      velocityX = -this.moveSpeed;
      isMoving = true;
    } else if (this.cursors.right.isDown) {
      velocityX = this.moveSpeed;
      isMoving = true;
    }
    
    if (this.cursors.up.isDown) {
      velocityY = -this.moveSpeed;
      isMoving = true;
    } else if (this.cursors.down.isDown) {
      velocityY = this.moveSpeed;
      isMoving = true;
    }
    
    // 同步移动所有对象
    if (isMoving) {
      const deltaSeconds = delta / 1000;
      const moveX = velocityX * deltaSeconds;
      const moveY = velocityY * deltaSeconds;
      
      // 计算移动距离
      const distance = Math.sqrt(moveX * moveX + moveY * moveY);
      this.totalDistance += distance;
      this.objectsMoving++;
      
      // 移动所有对象
      this.pinkObjects.forEach(obj => {
        obj.x += moveX;
        obj.y += moveY;
        
        // 边界检测，防止对象移出屏幕
        obj.x = Phaser.Math.Clamp(obj.x, 25, 775);
        obj.y = Phaser.Math.Clamp(obj.y, 25, 575);
      });
      
      // 每60帧更新一次状态文本（约1秒）
      if (this.objectsMoving % 60 === 0) {
        this.updateStatusText();
      }
    }
  }
  
  updateStatusText() {
    this.statusText.setText([
      'Pink Objects: 5',
      `Move Speed: ${this.moveSpeed}`,
      `Total Distance: ${this.totalDistance.toFixed(2)}`,
      `Move Count: ${this.objectsMoving}`,
      'Use Arrow Keys to Move'
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);