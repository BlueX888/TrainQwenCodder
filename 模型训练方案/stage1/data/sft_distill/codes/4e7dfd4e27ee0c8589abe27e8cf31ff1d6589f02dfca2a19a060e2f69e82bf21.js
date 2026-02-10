class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.objects = [];
    this.totalDistance = 0; // 可验证的状态信号
    this.activeObjectCount = 15; // 活动对象数量
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const objectSize = 20;
    const speed = 240;
    
    // 创建15个紫色圆形对象
    for (let i = 0; i < 15; i++) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0x9932CC, 1); // 紫色
      graphics.fillCircle(0, 0, objectSize);
      
      // 随机初始位置，确保不会超出边界
      const x = Phaser.Math.Between(objectSize, 800 - objectSize);
      const y = Phaser.Math.Between(objectSize, 600 - objectSize);
      
      graphics.setPosition(x, y);
      
      // 存储对象信息
      this.objects.push({
        graphics: graphics,
        size: objectSize,
        velocity: { x: 0, y: 0 }
      });
    }
    
    // 创建方向键输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 存储速度常量
    this.moveSpeed = speed;
    
    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateStatusText();
    
    console.log('Game initialized: 15 purple objects created');
    console.log('Use arrow keys to move all objects simultaneously');
  }

  update(time, delta) {
    // 计算移动方向
    let velocityX = 0;
    let velocityY = 0;
    
    if (this.cursors.left.isDown) {
      velocityX = -1;
    } else if (this.cursors.right.isDown) {
      velocityX = 1;
    }
    
    if (this.cursors.up.isDown) {
      velocityY = -1;
    } else if (this.cursors.down.isDown) {
      velocityY = 1;
    }
    
    // 标准化对角线移动速度
    if (velocityX !== 0 && velocityY !== 0) {
      const diagonal = Math.sqrt(2);
      velocityX /= diagonal;
      velocityY /= diagonal;
    }
    
    // 计算实际速度（像素/秒转换为像素/帧）
    const actualVelocityX = velocityX * this.moveSpeed * (delta / 1000);
    const actualVelocityY = velocityY * this.moveSpeed * (delta / 1000);
    
    // 同步移动所有对象
    let moved = false;
    this.objects.forEach(obj => {
      if (actualVelocityX !== 0 || actualVelocityY !== 0) {
        const newX = obj.graphics.x + actualVelocityX;
        const newY = obj.graphics.y + actualVelocityY;
        
        // 边界检测
        const clampedX = Phaser.Math.Clamp(newX, obj.size, 800 - obj.size);
        const clampedY = Phaser.Math.Clamp(newY, obj.size, 600 - obj.size);
        
        obj.graphics.setPosition(clampedX, clampedY);
        
        // 计算实际移动距离
        const dx = clampedX - (obj.graphics.x - actualVelocityX);
        const dy = clampedY - (obj.graphics.y - actualVelocityY);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          moved = true;
        }
      }
    });
    
    // 更新总移动距离
    if (moved && (actualVelocityX !== 0 || actualVelocityY !== 0)) {
      const frameDistance = Math.sqrt(
        actualVelocityX * actualVelocityX + 
        actualVelocityY * actualVelocityY
      );
      this.totalDistance += frameDistance;
      this.updateStatusText();
    }
  }
  
  updateStatusText() {
    this.statusText.setText(
      `Objects: ${this.activeObjectCount}\n` +
      `Speed: ${this.moveSpeed} px/s\n` +
      `Distance: ${Math.floor(this.totalDistance)} px`
    );
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

const game = new Phaser.Game(config);