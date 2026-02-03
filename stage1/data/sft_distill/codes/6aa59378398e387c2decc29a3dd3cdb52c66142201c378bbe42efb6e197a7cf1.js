class BossBattleScene extends Phaser.Scene {
  constructor() {
    super('BossBattleScene');
    this.bossHealth = 8;
    this.bulletsFired = 0;
    this.isVictory = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      bossHealth: this.bossHealth,
      bulletsFired: this.bulletsFired,
      isVictory: this.isVictory
    };

    // 创建Boss纹理（紫色方块）
    const bossGraphics = this.add.graphics();
    bossGraphics.fillStyle(0x9932cc, 1); // 紫色
    bossGraphics.fillRect(0, 0, 80, 80);
    bossGraphics.generateTexture('bossTex', 80, 80);
    bossGraphics.destroy();

    // 创建玩家纹理（绿色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillTriangle(16, 0, 0, 32, 32, 32);
    playerGraphics.generateTexture('playerTex', 32, 32);
    playerGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bulletTex', 8, 8);
    bulletGraphics.destroy();

    // 创建Boss
    this.boss = this.physics.add.sprite(400, 150, 'bossTex');
    this.boss.setCollideWorldBounds(true);
    
    // Boss左右移动
    this.tweens.add({
      targets: this.boss,
      x: 600,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'playerTex');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bulletTex',
      maxSize: 20
    });

    // 鼠标点击发射子弹
    this.input.on('pointerdown', (pointer) => {
      if (this.isVictory) return;
      this.shootBullet(pointer);
    });

    // 键盘控制玩家移动
    this.cursors = this.input.keyboard.createCursorKeys();

    // 碰撞检测：子弹击中Boss
    this.physics.add.overlap(this.bullets, this.boss, this.hitBoss, null, this);

    // UI文本
    this.healthText = this.add.text(16, 16, `Boss HP: ${this.bossHealth}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.bulletCountText = this.add.text(16, 50, `Bullets: ${this.bulletsFired}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.victoryText = this.add.text(400, 300, '', {
      fontSize: '48px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    this.victoryText.setOrigin(0.5);
    this.victoryText.setVisible(false);

    console.log('[Game] Boss Battle Started', JSON.stringify(window.__signals__));
  }

  update(time, delta) {
    if (this.isVictory) return;

    // 玩家移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 清理出界子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        this.bullets.killAndHide(bullet);
      }
    });
  }

  shootBullet(pointer) {
    // 从玩家位置发射子弹
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.enable = true;
      
      // 计算子弹方向（朝向鼠标点击位置）
      const angle = Phaser.Math.Angle.Between(
        this.player.x, 
        this.player.y, 
        pointer.x, 
        pointer.y
      );
      
      this.physics.velocityFromRotation(angle, 300, bullet.body.velocity);
      
      this.bulletsFired++;
      this.bulletCountText.setText(`Bullets: ${this.bulletsFired}`);
      
      // 更新信号
      window.__signals__.bulletsFired = this.bulletsFired;
      
      console.log('[Game] Bullet Fired', JSON.stringify({
        bulletsFired: this.bulletsFired,
        position: { x: bullet.x, y: bullet.y }
      }));
    }
  }

  hitBoss(bullet, boss) {
    // 子弹击中Boss
    this.bullets.killAndHide(bullet);
    bullet.body.enable = false;
    
    this.bossHealth--;
    this.healthText.setText(`Boss HP: ${this.bossHealth}`);
    
    // 更新信号
    window.__signals__.bossHealth = this.bossHealth;
    
    // Boss受击闪烁效果
    this.tweens.add({
      targets: boss,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 1
    });

    console.log('[Game] Boss Hit', JSON.stringify({
      bossHealth: this.bossHealth,
      bulletsFired: this.bulletsFired
    }));

    // 检查是否胜利
    if (this.bossHealth <= 0) {
      this.victory();
    }
  }

  victory() {
    this.isVictory = true;
    window.__signals__.isVictory = true;
    
    // 停止Boss移动
    this.tweens.killTweensOf(this.boss);
    
    // Boss消失动画
    this.tweens.add({
      targets: this.boss,
      alpha: 0,
      scale: 0,
      duration: 500,
      ease: 'Power2'
    });

    // 显示胜利文本
    this.victoryText.setText('VICTORY!');
    this.victoryText.setVisible(true);
    
    this.tweens.add({
      targets: this.victoryText,
      scale: 1.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    console.log('[Game] Victory!', JSON.stringify({
      bossHealth: this.bossHealth,
      bulletsFired: this.bulletsFired,
      isVictory: this.isVictory
    }));
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: BossBattleScene
};

new Phaser.Game(config);