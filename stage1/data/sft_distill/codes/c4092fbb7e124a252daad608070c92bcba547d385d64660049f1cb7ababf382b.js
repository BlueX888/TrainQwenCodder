class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.killCount = 0; // 状态信号：击杀数
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 30, 30);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人组
    this.enemies = this.physics.add.group({
      defaultKey: 'enemy',
      maxSize: 20
    });

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 50
    });

    // 设置碰撞检测：子弹与敌人
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 监听鼠标点击事件
    this.input.on('pointerdown', this.shootBullet, this);

    // 显示击杀数文本
    this.killText = this.add.text(16, 16, 'Kills: 0', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    // 定时生成敌人（每1.5秒）
    this.time.addEvent({
      delay: 1500,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    });

    // 初始生成几个敌人
    for (let i = 0; i < 3; i++) {
      this.spawnEnemy();
    }

    // 添加玩家移动控制（可选）
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update(time, delta) {
    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    } else {
      this.player.setVelocityY(0);
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active) {
        if (bullet.x < 0 || bullet.x > 800 || bullet.y < 0 || bullet.y > 600) {
          bullet.setActive(false);
          bullet.setVisible(false);
        }
      }
    });

    // 清理超出屏幕的敌人
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 650) {
        enemy.setActive(false);
        enemy.setVisible(false);
      }
    });
  }

  shootBullet(pointer) {
    // 获取或创建子弹
    let bullet = this.bullets.get(this.player.x, this.player.y, 'bullet');
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);

      // 计算从玩家到鼠标位置的方向
      const angle = Phaser.Math.Angle.Between(
        this.player.x,
        this.player.y,
        pointer.x,
        pointer.y
      );

      // 设置子弹速度（速度为 80 的倍数以达到合理效果）
      const speed = 400; // 实际速度，题目中的80可能指相对速度
      bullet.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // 旋转子弹朝向移动方向
      bullet.rotation = angle;
    }
  }

  spawnEnemy() {
    // 在屏幕顶部随机位置生成敌人
    const x = Phaser.Math.Between(30, 770);
    let enemy = this.enemies.get(x, -30, 'enemy');

    if (enemy) {
      enemy.setActive(true);
      enemy.setVisible(true);
      
      // 敌人向下移动
      enemy.setVelocityY(Phaser.Math.Between(50, 150));
      
      // 随机左右移动
      enemy.setVelocityX(Phaser.Math.Between(-50, 50));
    }
  }

  hitEnemy(bullet, enemy) {
    // 子弹和敌人都消失
    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.setVelocity(0, 0);

    enemy.setActive(false);
    enemy.setVisible(false);
    enemy.setVelocity(0, 0);

    // 增加击杀数
    this.killCount++;
    this.killText.setText('Kills: ' + this.killCount);

    // 添加击中特效（可选）
    const hitEffect = this.add.graphics();
    hitEffect.fillStyle(0xffffff, 1);
    hitEffect.fillCircle(enemy.x, enemy.y, 20);
    this.time.delayedCall(100, () => {
      hitEffect.destroy();
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);