class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bulletsFired = 0; // 状态信号：发射的子弹总数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 40, 40);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();
    
    // 创建子弹纹理（白色圆形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffffff, 1);
    bulletGraphics.fillCircle(5, 5, 5);
    bulletGraphics.generateTexture('bullet', 10, 10);
    bulletGraphics.destroy();
    
    // 创建玩家精灵（居中）
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true);
    
    // 创建子弹对象池
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50, // 对象池最大容量
      runChildUpdate: false
    });
    
    // 设置键盘输入
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    
    // 添加按键事件监听
    this.keyW.on('down', () => this.fireBullet(0, -1)); // 向上
    this.keyA.on('down', () => this.fireBullet(-1, 0)); // 向左
    this.keyS.on('down', () => this.fireBullet(0, 1));  // 向下
    this.keyD.on('down', () => this.fireBullet(1, 0));  // 向右
    
    // 显示发射计数文本
    this.counterText = this.add.text(16, 16, 'Bullets Fired: 0', {
      fontSize: '20px',
      fill: '#ffffff'
    });
  }

  fireBullet(dirX, dirY) {
    // 从对象池获取或创建子弹
    const bullet = this.bullets.get(this.player.x, this.player.y);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      
      // 设置子弹速度（方向 * 速度300）
      bullet.body.velocity.x = dirX * 300;
      bullet.body.velocity.y = dirY * 300;
      
      // 更新发射计数
      this.bulletsFired++;
      this.counterText.setText('Bullets Fired: ' + this.bulletsFired);
    }
  }

  update(time, delta) {
    const { width, height } = this.cameras.main;
    
    // 检查所有活跃的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        // 检查是否离开边界
        if (bullet.x < -20 || bullet.x > width + 20 ||
            bullet.y < -20 || bullet.y > height + 20) {
          // 回收子弹到对象池
          bullet.setActive(false);
          bullet.setVisible(false);
          bullet.body.velocity.set(0, 0);
        }
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);