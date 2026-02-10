class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号：记录排序次数
    this.objects = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建紫色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9933ff, 1); // 紫色
    graphics.fillRoundedRect(0, 0, 60, 60, 8);
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeRoundedRect(0, 0, 60, 60, 8);
    graphics.generateTexture('purpleBox', 60, 60);
    graphics.destroy();

    // 创建20个紫色物体，随机分布
    const startX = 100;
    const startY = 100;
    const spacing = 80;
    
    for (let i = 0; i < 20; i++) {
      // 随机位置
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      
      const obj = this.add.image(x, y, 'purpleBox');
      obj.setInteractive({ draggable: true });
      obj.setData('originalIndex', i);
      
      // 添加序号文本
      const text = this.add.text(0, 0, (i + 1).toString(), {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      text.setOrigin(0.5);
      
      // 将文本作为子对象
      obj.text = text;
      text.x = obj.x;
      text.y = obj.y;
      
      this.objects.push(obj);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 同步文本位置
      if (gameObject.text) {
        gameObject.text.x = dragX;
        gameObject.text.y = dragY;
      }
      
      // 拖拽时高亮
      gameObject.setScale(1.1);
      gameObject.setAlpha(0.8);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 将拖拽的物体置于顶层
      this.children.bringToTop(gameObject);
      if (gameObject.text) {
        this.children.bringToTop(gameObject.text);
      }
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复正常状态
      gameObject.setScale(1);
      gameObject.setAlpha(1);
      
      // 触发自动排序
      this.autoSort();
    });

    // 添加说明文本
    this.add.text(400, 30, '拖拽紫色方块，松手后自动按Y坐标排序', {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortText = this.add.text(400, 570, `排序次数: ${this.sortCount}`, {
      fontSize: '18px',
      color: '#ffff00'
    }).setOrigin(0.5);
  }

  autoSort() {
    // 增加排序计数
    this.sortCount++;
    this.sortText.setText(`排序次数: ${this.sortCount}`);

    // 按 Y 坐标排序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);

    // 计算新的排列位置（左侧垂直排列）
    const targetX = 100;
    const startY = 80;
    const spacing = 25;

    sorted.forEach((obj, index) => {
      const targetY = startY + index * spacing;

      // 使用 Tween 动画平滑移动
      this.tweens.add({
        targets: obj,
        x: targetX,
        y: targetY,
        duration: 500,
        ease: 'Power2',
        onUpdate: () => {
          // 同步文本位置
          if (obj.text) {
            obj.text.x = obj.x;
            obj.text.y = obj.y;
          }
        }
      });

      // 同步文本动画
      if (obj.text) {
        this.tweens.add({
          targets: obj.text,
          x: targetX,
          y: targetY,
          duration: 500,
          ease: 'Power2'
        });
      }
    });

    // 添加排序完成的视觉反馈
    this.cameras.main.shake(100, 0.002);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 暴露状态用于验证
window.getGameState = () => {
  const scene = game.scene.scenes[0];
  return {
    sortCount: scene.sortCount,
    objectCount: scene.objects.length,
    objectPositions: scene.objects.map(obj => ({ x: obj.x, y: obj.y }))
  };
};